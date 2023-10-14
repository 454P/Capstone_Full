import { ComponentProps } from 'react';
import styled from '@emotion/styled';
import { Flex } from '@/components/common';

interface Props extends ComponentProps<'input'> {
  name: string;
}

function Input({ name, ...restProps }: Props) {
  return (
    <Flex gap={20} justifyContent='flex-end'>
      {name}
      <InputContainer name={name} {...restProps} />
    </Flex>
  );
}

export default Input;

const InputContainer = styled.input`
  ${({ theme }) => theme.typography.Bold20};
  background-color: ${({ theme }) => theme.colors.brown2};
  color: ${({ theme }) => theme.colors.gray2};

  width: 280px;
  height: 40px;
  border: none;
  border-radius: 5px;
  padding: 0 20px 0 20px;

  &:focus {
    outline: solid 2px ${({ theme }) => theme.colors.brown1};
  }
`;
