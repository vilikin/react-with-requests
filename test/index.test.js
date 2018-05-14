import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import TheComponent from '../src/index';

Enzyme.configure({ adapter: new Adapter() });

test('Stuff happens like it should', () => {
  // Render a checkbox with label in the document
  const component = mount(<TheComponent test={1} />);
  expect(component).toHaveProp('test', 1);
});

test('Stuff happens like it should again', () => {
  // Render a checkbox with label in the document
  const component = mount(<TheComponent test={1} />);

  component.find('input').simulate('change');

  expect(component).toHaveText('This is visible');
});
