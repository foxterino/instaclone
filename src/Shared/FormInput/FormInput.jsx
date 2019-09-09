import React from 'react'
import './FormInput.css'

function FormInput(props) {
  return (
    <div className='input-box'>
      <input
        value={props.value}
        className={props.className}
        onChange={props.handleChange}
        type={props.type}
        required
      />
      <label className={props.className}>{props.label}</label>
    </div>
  );
}

export default FormInput;