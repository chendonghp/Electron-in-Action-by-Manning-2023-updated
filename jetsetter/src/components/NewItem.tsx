import React, { useState, ChangeEvent, FormEvent } from 'react';


const NewItem= ({ onSubmit = () => {} }) => {
  const [value, setValue] = useState<string>('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({ value, packed: false});
    setValue('');
  }

  return (
    <form className="NewItem" onSubmit={handleSubmit}>
      <input className="NewItem-input" type="text" value={value} onChange={handleChange} />
      <input className="NewItem-submit button" type="submit" />
    </form>
  );
}

export default NewItem;