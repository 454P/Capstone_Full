import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { emitter } from '@/game/scenes/constants';
import { socketState } from '@/states';
import axios, { AxiosError } from 'axios';
import { useRecoilValue } from 'recoil';
import { Button, Flex, Typography } from '@/components/common';

interface WordProps {
  fail_count: number;
  image_path: string;
  success_count: number;
  word: string;
}

function ReviewPage() {
  const mySocket = useRecoilValue(socketState);
  const [data, setData] = useState<WordProps[]>();
  const [idx, setIdx] = useState(0);
  const navigate = useNavigate();

  const handlePreviousButton = () => {
    setIdx((old) => old - 1);
  };
  const handleClickNextButton = () => {
    setIdx((old) => old + 1);
  };
  const handleClickCloseButton = () => {
    navigate('/town');
  };

  async function getData() {
    try {
      const response = await axios.post('http://localhost:8000/setting/review', {
        api: mySocket.apiKey,
      });
      console.log(response);
      setData(response.data.words);
    } catch (error) {
      const { response } = error as unknown as AxiosError;
      console.log(response);
    }
  }

  useEffect(() => {
    // emitter.on('start review', () => {
    //   console.log('start review');
    // });

    console.log(mySocket);
    getData();
  }, []);

  if (!data) return <div></div>;
  console.log(idx);
  console.log('http://localhost:8000' + data[idx].image_path);
  return (
    <ReviewContainer>
      <Typography color='white0' font='Bold76'>
        {data[idx].word}
      </Typography>
      <Video muted autoPlay src={'http://localhost:8000' + data[idx].image_path} />

      <Flex flexDirection='row'>
        {idx && (
          <Button color='white' size='small' onClick={handlePreviousButton}>
            <Typography color='brown1' font='Bold20'>
              이전
            </Typography>
          </Button>
        )}
        {idx !== data.length - 1 && (
          <Button color='white' size='small' onClick={handleClickNextButton}>
            <Typography color='brown1' font='Bold20'>
              다음
            </Typography>
          </Button>
        )}
        <Button color='white' size='small' onClick={handleClickCloseButton}>
          <Typography color='brown1' font='Bold20'>
            종료
          </Typography>
        </Button>
      </Flex>
    </ReviewContainer>
  );
}

export default ReviewPage;

const ReviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100vw;
  height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: black;
`;

const Video = styled.video`
  width: 500px;
  height: 500px;
`;
