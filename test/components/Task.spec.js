import React from 'react';
import { Task } from '../../src/components/Task';
import { shallow } from 'enzyme';
import expect from 'expect';
import sinon from 'sinon';

describe.only('Task', () => {
  it('should render a checkbox if the task is editable', () => {
    const wrapper = shallow(<Task editable />);
    expect(wrapper.find('input').length).toBe(1);
  });

  it('should only render a div with the task text if not editable', () => {
    const wrapper = shallow(<Task text="Hei" />);
    expect(wrapper.find('input').length).toBe(0);
    expect(wrapper.contains(<div>Hei</div>)).toBe(true);
  });

  it('should callback when the task is checked complete', () => {
    const onCheck = sinon.spy();
    const wrapper = shallow(<Task editable onCheck={onCheck} />);
    wrapper.find('input').simulate('change', { target: { checked: true } });
    expect(onCheck.calledOnce).toBe(true);
    expect(onCheck.calledWith(true)).toBe(true);
  });
});
