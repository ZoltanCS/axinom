import { useState, useCallback } from 'react';

type Operator = '+' | '-' | '×' | '÷' | null;

export function AXI_Calculator() {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand]);

  const clear = useCallback(() => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  const toggleSign = useCallback(() => {
    setDisplay(String(parseFloat(display) * -1));
  }, [display]);

  const inputPercent = useCallback(() => {
    setDisplay(String(parseFloat(display) / 100));
  }, [display]);

  const performOperation = useCallback((nextOperator: Operator) => {
    const inputValue = parseFloat(display);
    
    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const currentValue = prevValue || 0;
      let result: number;
      
      switch (operator) {
        case '+': result = currentValue + inputValue; break;
        case '-': result = currentValue - inputValue; break;
        case '×': result = currentValue * inputValue; break;
        case '÷': result = currentValue / inputValue; break;
        default: result = inputValue;
      }
      
      setDisplay(String(result));
      setPrevValue(result);
    }
    
    setWaitingForOperand(true);
    setOperator(nextOperator);
  }, [display, operator, prevValue]);

  const calculate = useCallback(() => {
    if (!operator || prevValue === null) return;
    performOperation(null);
    setOperator(null);
    setPrevValue(null);
  }, [operator, prevValue, performOperation]);

  const btnStyle: React.CSSProperties = {
    height: 56,
    border: 'none',
    borderRadius: 12,
    fontSize: 20,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.1s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const numBtnStyle: React.CSSProperties = {
    ...btnStyle,
    background: 'rgba(30, 41, 59, 0.8)',
    color: '#f1f5f9',
  };

  const opBtnStyle: React.CSSProperties = {
    ...btnStyle,
    background: 'rgba(6, 182, 212, 0.2)',
    color: '#06b6d4',
  };

  const funcBtnStyle: React.CSSProperties = {
    ...btnStyle,
    background: 'rgba(148, 163, 184, 0.15)',
    color: '#94a3b8',
  };

  const equalsBtnStyle: React.CSSProperties = {
    ...btnStyle,
    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    color: '#fff',
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: 16, background: '#0a0e1a' }}>
      {/* Display */}
      <div style={{ 
        flex: '0 0 100px', 
        background: 'rgba(15, 23, 42, 0.8)', 
        borderRadius: 16, 
        marginBottom: 16, 
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        border: '1px solid rgba(148, 163, 184, 0.1)'
      }}>
        {prevValue !== null && operator && (
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>
            {prevValue} {operator}
          </div>
        )}
        <div style={{ 
          fontSize: 42, 
          fontWeight: 300, 
          color: '#f1f5f9',
          fontFamily: "'JetBrains Mono', monospace",
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}>
          {display}
        </div>
      </div>

      {/* Buttons Grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {/* Row 1 */}
        <button style={funcBtnStyle} onClick={clear}>AC</button>
        <button style={funcBtnStyle} onClick={toggleSign}>±</button>
        <button style={funcBtnStyle} onClick={inputPercent}>%</button>
        <button style={opBtnStyle} onClick={() => performOperation('÷')}>÷</button>

        {/* Row 2 */}
        <button style={numBtnStyle} onClick={() => inputDigit('7')}>7</button>
        <button style={numBtnStyle} onClick={() => inputDigit('8')}>8</button>
        <button style={numBtnStyle} onClick={() => inputDigit('9')}>9</button>
        <button style={opBtnStyle} onClick={() => performOperation('×')}>×</button>

        {/* Row 3 */}
        <button style={numBtnStyle} onClick={() => inputDigit('4')}>4</button>
        <button style={numBtnStyle} onClick={() => inputDigit('5')}>5</button>
        <button style={numBtnStyle} onClick={() => inputDigit('6')}>6</button>
        <button style={opBtnStyle} onClick={() => performOperation('-')}>−</button>

        {/* Row 4 */}
        <button style={numBtnStyle} onClick={() => inputDigit('1')}>1</button>
        <button style={numBtnStyle} onClick={() => inputDigit('2')}>2</button>
        <button style={numBtnStyle} onClick={() => inputDigit('3')}>3</button>
        <button style={opBtnStyle} onClick={() => performOperation('+')}>+</button>

        {/* Row 5 */}
        <button style={numBtnStyle} onClick={() => inputDigit('0')}>0</button>
        <button style={numBtnStyle} onClick={inputDecimal}>.</button>
        <button style={equalsBtnStyle} onClick={calculate}>=</button>
      </div>
    </div>
  );
}
