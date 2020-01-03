import React, {useState, useEffect} from 'react';
import {MemoryCell, MemoryState} from '../../App';
import './MemoryDisplay.css';
const MemoryDisplay: React.FC<{memory: MemoryState[], displayed: boolean, exceptions: number[]}> = (props) => {

  const [fragmentedFilesPercentage, setFilesFragmentedPercentage] = useState(-1);
  const [fragmentedFilesSpacePercentage, setFragmentedFilesSpacesPercentage] = useState(-1);

  const [memoryTable, setMemoryTable] = useState();

  const processColors: { [key:string]: string} = {
    A: '#5C6BC0',
    B: '#FFEE58',
    C: '#F48FB1',
    D: '#9575CD',
    E: '#42A5F5',
    F: '#26A69A',
    G: '#FF9800',
    H: '#90A4AE',
    I: '#8D6E63',
    J: '#D4E157',
    K: '#FFCA28',
  };

  useEffect(() => {
    console.log('memory display', props.memory);
    const header: JSX.Element[] = [<th></th>];
    const rows: JSX.Element[] = [];

    for(let i = 0; i < 50; i++) {
      header.push((<th key={`headercell${i}`}>{i}</th>))
    }

    props.memory.forEach((memoryRow: MemoryState, index) => {
      const memoryTableCells = memoryRow.map((cell: MemoryCell, cellIndex) => {
        let processColor;
        if (!cell.filled) {
          processColor = 'white';
        } else {
          if (cell.process && processColors[cell.process]) {
            processColor = processColors[cell.process];
          } else {
            processColor = 'red';
          }
        }
        return (<td key={`cell${cellIndex}:${index}`} style={{backgroundColor: processColor, border: '1px solid black'}}>{cell.process}</td>)
      });

      if (props.exceptions.indexOf(index) > -1) {
        rows.push(
          <tr><td>{index}</td><td colSpan={50}>Ei suutnud mahutada!!</td></tr>
        )
      } else {
        rows.push(
          <tr><td>{index}</td>{memoryTableCells}</tr>
        )
      }
    });

    const lastMemoryRow = props.memory[props.memory.length - 1];
    const allFiles = Array.from(new Set(lastMemoryRow.map(cell => cell.process)))
      .filter(file => file !== undefined && file !== '-');
    let fragmentedFiles = [...allFiles];

    allFiles.forEach((fileToProcess) => {
      // @ts-ignore
      const indicesOfFile: number[] = lastMemoryRow
        .map((file, index) => file.process === fileToProcess ? index : null)
        .filter(index => index !== null);



      const isContinuous = indicesOfFile.every((index, indexOfIndex) => {
        if (indexOfIndex > 0 && indexOfIndex < indicesOfFile.length - 1) {
          return indicesOfFile[indexOfIndex + 1] === index + 1 && indicesOfFile[indexOfIndex - 1] === index - 1;
        }
        return true;
      });

      if (isContinuous) {
        fragmentedFiles = fragmentedFiles.filter(file => file !== fileToProcess);
      }
    });

    setFilesFragmentedPercentage(Math.floor((fragmentedFiles.length / allFiles.length) * 10000) / 100);

    const totalSpaceTaken = (lastMemoryRow
      .map(cell => cell.filled ? 1 : 0) as number[])
      .reduce((a, b) => a + b, 0);

    const spaceTakenByFragmentedFiles = (lastMemoryRow
      .map(cell => cell.filled && fragmentedFiles.indexOf(cell.process) > -1 ? 1 : 0) as number[])
      .reduce((a, b) => a + b, 0);


    setFragmentedFilesSpacesPercentage(Math.floor((spaceTakenByFragmentedFiles / totalSpaceTaken) * 10000) / 100);
    setMemoryTable(
      <table>
        <thead><tr>{header}</tr></thead>
        <tbody>{rows}</tbody>
      </table>
    );

  }, [props.memory]);

  return (
    <div className="MemoryDisplay">
      { props.displayed ? <div>Allesjäänud failidest on fragmenteeritud {fragmentedFilesPercentage}%</div> : null}
      { props.displayed ? <div>Fragmenteerunud failidele kuulub  {fragmentedFilesSpacePercentage}% kasutatud ruumist</div> : null}
      {props.displayed ? memoryTable : <span>mälutabel ilmub siia</span>}
    </div>
  );
};


export default MemoryDisplay
