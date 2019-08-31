import React, {Component} from 'react';
import {FormControl} from 'react-bootstrap';
import {EnhanceInputWithLabel} from '../../../enhancers/EnhanceInputWithLabel';
import {EnhanceInputWithAddons, EnhanceInputWithAddonsProps} from '../../../enhancers/EnhanceInputWithAddons';

export type BaseInputProps<T> = EnhanceInputWithAddonsProps & {
  label?: string,
  type?: 'textarea' | 'text' | 'number',
  value?: T,
  onChange: (e: T) => void,
  onBlur?: (e: any) => void,
  style?: React.CSSProperties,
  placeholder?: string,
}

export const BaseInput = EnhanceInputWithLabel(EnhanceInputWithAddons(class extends Component<BaseInputProps<any>> {
  render() {
    const {type} = this.props;
    return (
      <FormControl
        type={type === 'textarea' ? 'text' : type}
        as={type === 'textarea' ? 'textarea' : undefined}
        className={type === 'textarea' ? 'textarea' : undefined}
        value={this.props.value}
        placeholder={this.props.placeholder}
        onChange={this.props.onChange}
        onBlur={this.props.onBlur}
        style={this.props.style}
        data-tst={this.props['data-tst']}
      />
    );
  }
}));