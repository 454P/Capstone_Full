import { HTMLAttributes } from 'react';
import styled from '@emotion/styled';
import formImg from '@/assets/images/register_form.png';

type Props = HTMLAttributes<HTMLFormElement>;

function Form({ children, ...restProps }: Props) {
  return <StyledForm {...restProps}>{children}</StyledForm>;
}

export default Form;

const StyledForm = styled.form`
  ${({ theme }) => theme.typography.Bold20}
  color: ${({ theme }) => theme.colors.gray1};
  background-image: url(${formImg});
  background-size: contain;
  background-repeat: no-repeat;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  padding: 20px 0 10px 0;

  width: 512px;
  height: 320px;
`;
