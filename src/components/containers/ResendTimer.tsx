import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type Props = {
  time?: number; // Optional, defaults to DEFAULT_TIME
  handleResendClicked: (canResend: boolean) => void;
};

const DEFAULT_TIME = 5;

const ResentTimer = ({ time = DEFAULT_TIME, handleResendClicked }: Props) => {
  const [counter, setCounter] = useState<number>(time);
  const [canResend, setCanResend] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    setCounter(time);
    setCanResend(false);
    handleResendClicked(false); // Disable button
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setCounter(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setCanResend(true);
          handleResendClicked(true); // Enable resend
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [time]);

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 10 }}>
      {canResend ? (
        <TouchableOpacity onPress={startTimer}>
          <Text style={{ fontSize: 15, color: '#177DFF' }}>Resend OTP</Text>
        </TouchableOpacity>
      ) : (
        <Text style={{ fontSize: 15 }}>
          Resend OTP in{' '}
          <Text style={{ color: '#177DFF' }}>{counter} secs</Text>
        </Text>
      )}
    </View>
  );
};

export default ResentTimer;
