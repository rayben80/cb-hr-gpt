import { memo } from 'react';
import { useEvaluationLibrary } from '../hooks/library/useEvaluationLibrary';
import LibraryViews from './library/LibraryViews';

const EvaluationLibrary = memo(() => {
    const logic = useEvaluationLibrary();
    return <LibraryViews {...logic} />;
});

export default EvaluationLibrary;
