import React, {ChangeEvent, FormEvent} from 'react';
import { FunctionComponent, useState } from 'react';
import './ProcessInput.css';

const ProcessInput: FunctionComponent<
  {
    onSubmitted: (process: string) => void
  }> = (props) => {

  const [processString, setProcessString] = useState('');
  const [selectedProcess, setSelectedProcess] = useState<'1' | '2' | '3' | ''>('');


  const onInput = (event: ChangeEvent) => {
    setSelectedProcess('');
    setProcessString((event.target as HTMLInputElement).value);
  };

  const onRadioClick = (event: ChangeEvent) => {
    const values = {
      '1': 'A,2;B,3;A,-;C,4;D,5;B,-;E,5',
      '2': 'A,4;B,3;C,6;D,5;B,-;E,5;A,-;F,10',
      '3': 'A,2;B,3;A,-;C,4;D,5;B,-;E,15',
    };

    setSelectedProcess(((event.target as HTMLInputElement).value as '1' | '2' | '3'));
    setProcessString(values[((event.target as HTMLInputElement).value as '1' | '2' | '3')]);
  };

  const onSubmit = (event: FormEvent) => {
    props.onSubmitted(processString);
    event.preventDefault();
  };


  return (
    <form onSubmit={onSubmit}>
      <h1>OS kodutöö 4, failisüsteemi simulatsioon</h1>
      <h5>Sander Nemvalts</h5>
      <h2>Testmuster: </h2>
      <input type="text"
             pattern="^(([A-Za-z],(\d|-)+;?){1,12})$"
             value={processString}
             className='pattern-input'
             onChange={onInput}/>

      <div className="radio-container">
        <div>
          <label>
          <input type="radio"
                 value='1'
                 name='first'
                 checked={selectedProcess === '1'}
                 onChange={onRadioClick}/>
          Esimene näidismuster</label>
        </div>
        <div>
          <label>
          <input type="radio"
                 value='2'
                 name='second'
                 checked={selectedProcess === '2'}

                 onChange={onRadioClick}/>
          Teine näidismuster</label>
        </div>
        <div>
          <label>
          <input type="radio"
                 value='3'
                 name='third'
                 checked={selectedProcess === '3'}
                 onChange={onRadioClick}/>
          Kolmas näidismuster
          </label>
        </div>
      </div>

      <button type="submit">Näita mälu visualisatsiooni</button>
    </form>
  )
};

export default ProcessInput;
