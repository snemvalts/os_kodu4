import React, {useEffect, useState} from 'react';
import './App.css';
import ProcessInput from './components/processinput/ProcessInput';
import MemoryDisplay from './components/memorydisplay/MemoryDisplay';

const App: React.FC = () => {
  const [memoryString, setMemoryString] = useState('');
  const [showMemory, setShowMemory] = useState(false);
  const [displayedMemory, setDisplayedMemory] = useState<MemoryState[]>([[]]);
  const [exceptionRows, setExceptionRows] = useState<number[]>([]);
  const [randomValue, setRandomValue] = useState<number>();

  const handleSubmit = (memoryString: string) => {
    setMemoryString(memoryString);
    setRandomValue(Math.random());
    setShowMemory(true);
  };




  useEffect(() => {
    const memoryStates: MemoryState[] = [];
    const exceptionRows: number[] = [];
    const processes = parseMemoryString(memoryString);


    for (let i = 0; i < processes.length; i++) {
      let emptyMemory: MemoryCell[] = [];
      for (let i = 0; i < 50; i++) {
        emptyMemory.push({
          filled: false,
          process: '-'
        })
      }
      memoryStates.push(emptyMemory);
    }


    let doesntFit = false;

    processes.forEach((process, index) => {
      console.log(process);
      if (doesntFit) {
        return;
      }

      let memory = memoryStates[index];

      const name: string = process[0];
      const size = process[1];

      if (size === '-') {
        const indices = findIndicesOfProcess(memory, name);

        for (let i = index; i < memoryStates.length; i++ ){
          indices.forEach((processIndex) => {
            memoryStates[i][processIndex] = {
              filled: false,
              process: '-',
            };
          });
        }
      } else {
        const indices = findFreeIndices(memory, parseInt(size));

        if (indices === -1) {
          exceptionRows.push(index);
          doesntFit = true;
        } else {
          for (let i = index; i < memoryStates.length; i++ ) {
            indices.forEach((processIndex) => {
              memoryStates[i][processIndex] = {
                filled: true,
                process: name,
              }
            });
          }
        }
      }
    });

    setDisplayedMemory(memoryStates);
    setExceptionRows(exceptionRows);
  }, [memoryString, randomValue]);


  const parseMemoryString = (memoryString: string) => {
    return memoryString.split(';').map(token => token.split(','));
  };

  const findFreeIndices = (memory: MemoryState, size: number): -1 | number[] => {
    const indices = [];

    for (let i = 0; i < memory.length; i++) {
      if (indices.length === size) break;
      if (!memory[i].filled) {
        indices.push(i);
      }
    }

    if (indices.length !== size) {
      return -1;
    } else {
      return indices;
    }
  };

  const findIndicesOfProcess = (memory: MemoryState, name: string) => {
    const indices = [];

    for (let i = 0; i < memory.length ; i++) {
      if (memory[i].process === name) {
        indices.push(i);
      }
    }

    return indices;
  };

  return (
    <div className="App">
      <ProcessInput onSubmitted={handleSubmit}/>
      <MemoryDisplay displayed={showMemory} memory={displayedMemory} exceptions={exceptionRows}/>
    </div>
  );
};


const LastFit = (memory: MemoryState, size: number) => {
  let lastFilled = -1;

  if (memory.every(cell => !cell.filled)) {
    if (memory.length >= size) {
      return 0;
    }
  }

  for(let i = 0; i < memory.length; i++) {
    if (memory[i - 1] && memory[i - 1].filled && !memory[i].filled) {
      let free = true;
      for (let j = i; j < i + size; j++) {
        if (memory[j] === undefined) {
          free = false;
          break;
        }

        if (memory[j].filled) {
          free = false;
        }
      }


      if (free) {
        lastFilled = i;
      }
    }
  }

  return lastFilled;
};


const BestFit = (memory: MemoryState, size: number) => {
  const blocks = FindFreeBlocks(memory);

  let bestFitBlock: FreeBlock | null = null;

  blocks.forEach((block: FreeBlock) => {
    if (size <= block.size) {
      if (bestFitBlock === null) {
        bestFitBlock = block;
      } else if (bestFitBlock !== null && block.size < bestFitBlock.size) {
        bestFitBlock = block;
      }
    }
  });

  if (bestFitBlock === null) {
    return -1;
  } else {
    // @ts-ignore
    return bestFitBlock.start;
  }

};

const RandomFit = (memory: MemoryState, size: number) => {
  const blocks = FindFreeBlocks(memory).filter(block => size <= block.size);

  if (blocks.length === 0) {
    return -1;
  }

  return blocks[Math.floor(Math.random()*blocks.length)].start;
};

const WorstFit = (memory: MemoryState, size: number) => {
  const blocks = FindFreeBlocks(memory).filter(block => size <= block.size);

  let worstFitBlock: FreeBlock | null = null;

  blocks.forEach((block: FreeBlock) => {
    if (size <= block.size) {
      if (worstFitBlock === null) {
        worstFitBlock = block;
      } else if (worstFitBlock !== null && block.size > worstFitBlock.size) {
        worstFitBlock = block;
      }
    }
  });

  if (worstFitBlock === null) {
    return -1;
  } else {
    // @ts-ignore
    return worstFitBlock.start;
  }
};


const FindFreeBlocks = (memory: MemoryState): FreeBlock[] => {
  const blocks: FreeBlock[] = [];

  let searchingForEnd = false;
  let blockStart = 0;

  for(let i = 0; i < memory.length; i++) {
    if (!memory[i].filled && !searchingForEnd) {
      searchingForEnd = true;
      blockStart = i;
    }

    if (memory[i].filled && searchingForEnd) {
      blocks.push({
        start: blockStart,
        size: i - blockStart,
      });
      searchingForEnd = false;
      blockStart = -1;
    }
  }

  if (searchingForEnd) {
    blocks.push({
      start: blockStart,
      size: memory.length - blockStart,
    });
  }

  return blocks;
}

export default App;

export type MemoryState = MemoryCell[];

export interface MemoryCell {
  filled: boolean;
  process?: string;
  wontfit?: boolean;
}

export interface FreeBlock {
  start: number;
  size: number;
}
