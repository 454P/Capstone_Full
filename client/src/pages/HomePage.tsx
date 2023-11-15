import { Link } from 'react-router-dom';
import { Button, Flex, Typography } from '@/components/common';
import { HomeTemplate } from '@/components/home';

function HomePage() {
  return (
    <HomeTemplate>
      <Flex>
        <Link to='/register'>
          <Button color='brown'>
            <Typography font='Bold36'>회원가입</Typography>
          </Button>
        </Link>
        <Link to='/login'>
          <Button color='brown'>
            <Typography font='Bold36'>로그인</Typography>
          </Button>
        </Link>
      </Flex>
    </HomeTemplate>
  );
}

export default HomePage;
