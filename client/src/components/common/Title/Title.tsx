import styled from '@emotion/styled';
import { Flex } from '@/components/common';
import TitleImg from '@/assets/images/title.png';

interface Props {
  width?: string | number;
  height?: string | number;
  text: string;
}

function Title({ width, height, text }: Props) {
  return (
    <TitleContainer justifyContent='center' alignItems='center' width={width} height={height}>
      {text}
    </TitleContainer>
  );
}

export default Title;

const TitleContainer = styled(Flex)<Omit<Props, 'text'>>`
  ${({ theme }) => theme.typography.Bold76}
  color: ${({ theme }) => theme.colors.white1};
  width: ${({ width }) => width ?? '512px'};
  height: ${({ height }) => height ?? '128px'};

  background-image: url(${TitleImg});
  background-size: contain;
  background-repeat: no-repeat;
`;
