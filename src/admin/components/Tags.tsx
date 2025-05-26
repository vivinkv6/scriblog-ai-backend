import { SingleSelect, SingleSelectOption, Button } from '@strapi/design-system';
import { useState } from 'react';
import { unstable_useContentManagerContext as useContextManager } from '@strapi/strapi/admin';

const Tags = () => {
  const [selectedTag, setSelectedTag] = useState<string>('');

  const handleSave = () => {
    // Here you would typically make an API call to save the selected tag
    console.log('Saving tag:', selectedTag);
    // You could add your save logic here
  };

  const {model,slug}=useContextManager();

  console.log({model,slug});
  

  const handleChange = (value: string | number) => {
    setSelectedTag(value.toString());
  };

  return (
    <div>
      <SingleSelect 
        value={selectedTag}
        onChange={handleChange}
        aria-label="Select a tag"
        placeholder="Choose a tag"
        required
      >
        <SingleSelectOption value="apple">Apple</SingleSelectOption>
        <SingleSelectOption value="avocado">Avocado</SingleSelectOption>
        <SingleSelectOption value="banana">Banana</SingleSelectOption>
        <SingleSelectOption value="kiwi">Kiwi</SingleSelectOption>
        <SingleSelectOption value="mango">Mango</SingleSelectOption>
        <SingleSelectOption value="orange">Orange</SingleSelectOption>
        <SingleSelectOption value="strawberry">Strawberry</SingleSelectOption>
      </SingleSelect>
      <Button 
        onClick={handleSave} 
        style={{ marginTop: '1rem' }}
      >
        Save Tag
      </Button>
    </div>
  );
};

export default Tags;
