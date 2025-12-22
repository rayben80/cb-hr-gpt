import React, { useState } from 'react';
import { useError } from '../contexts/ErrorContext';

export const TestErrorComponent: React.FC = () => {
  const { showError } = useError();
  const [count, setCount] = useState(0);

  const handleTestError = () => {
    try {
      // 의도적으로 에러를 발생시킴
      throw new Error(`테스트 에러 발생! 카운트: ${count}`);
    } catch (error) {
      showError(
        '테스트 에러가 발생했습니다', 
        '이 메시지는 에러의 상세 정보를 보여줍니다. 사용자가 어떤 작업을 했을 때 이 에러가 발생했는지에 대한 설명이 여기에 포함됩니다.', 
        error as Error
      );
      setCount(count + 1);
    }
  };

  const handleTestWarning = () => {
    try {
      // 경고를 발생시키는 예시
      console.warn('테스트 경고 발생');
      throw new Error('경고 테스트용 에러');
    } catch (error) {
      showError(
        '경고 테스트', 
        '이것은 경고 테스트입니다. 실제 애플리케이션에서는 중요한 문제지만 심각하지 않은 상황에서 사용됩니다.', 
        error as Error
      );
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">에러 테스트 컴포넌트</h2>
      <p className="mb-4">이 컴포넌트는 에러 로그 기능을 테스트하기 위한 것입니다.</p>
      <div className="flex space-x-4">
        <button
          onClick={handleTestError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          에러 발생시키기
        </button>
        <button
          onClick={handleTestWarning}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        >
          경고 테스트
        </button>
      </div>
      <p className="mt-4 text-sm text-gray-600">
        버튼을 클릭하면 에러가 발생하고, 헤더의 버그 아이콘에 숫자가 표시됩니다.
        버그 아이콘을 클릭하면 에러 로그 모달에서 상세 정보를 확인할 수 있습니다.
      </p>
    </div>
  );
};