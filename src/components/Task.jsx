import React from 'react';

export function Task({ editable, checked, onCheck, text }) {
  if (editable) {
    return (
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onCheck(e.target.checked)} />
        {text}
      </label>
    );
  }
  return <div>{text}</div>;
}
