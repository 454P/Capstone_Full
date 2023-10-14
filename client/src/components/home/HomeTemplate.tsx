import { HTMLAttributes } from 'react';
import styled from '@emotion/styled';
import { Flex, Title } from '@/components/common';
import backgroundImg from '@/assets/images/background.png';

type Props = HTMLAttributes<HTMLDivElement>;

function HomeTemplate({ children, ...restProps }: Props) {
  return (
    <HomeContainer flexDirection='column' justifyContent='center' alignItems='center' gap={40} {...restProps}>
      <Title text='너의 손이 보여' width={600} height={150} />
      {children}
    </HomeContainer>
  );
}

export default HomeTemplate;

const HomeContainer = styled(Flex)`
  width: 100%;
  height: 100vh;
  background: url(${backgroundImg}) center;
  background-size: contain;
`;
