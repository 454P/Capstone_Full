import { ButtonHTMLAttributes } from 'react';
import styled from '@emotion/styled';
import buttonBrown from '@/assets/images/button_brown.png';
import buttonWhite from '@/assets/images/button_white.png';

type color = 'white' | 'brown';
type size = 'small' | 'large';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  color: color;
  size?: size;
}

function Button({ children, color, size = 'small', ...restProps }: Props) {
  return (
    <StyledButton color={color} size={size} {...restProps}>
      {children}
    </StyledButton>
  );
}

export default Button;

const StyledButton = styled.button<Props>`
  color: ${({ color, theme }) => (color === 'brown' ? theme.colors.white1 : theme.colors.brown1)};
  background-image: ${({ color }) => (color === 'brown' ? `url(${buttonBrown})` : `url(${buttonWhite})`)};
  background-size: contain;
  background-repeat: no-repeat;

  width: ${({ size }) => (size === 'small' ? '208px' : '448px')};
  height: ${({ size }) => (size === 'small' ? '80px' : '172px')};
`;
