import { CountUp } from 'use-count-up';
export default function InfoCard ({ 
  value, 
  label,
  isUsd,
}: {
  value: number,
  label: string,
  isUsd?: boolean
}) {
  const decimalPlaces = 0;
  const countUpProps = {
    isCounting: true,
    start: 0,
    end: value,
    duration: 3,
    shouldUseToLocaleString: true,
    toLocaleStringParams: {
      locale: undefined, 
      options: {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      }
    },
    prefix: "",
    suffix: "",
    decimalPlaces,
    thousandsSeparator: '',
    decimalSeparator: '',
    formatter: (value: number) => kFormatter(value),
  }

  const kFormatter = (num: number) => {
    let res = Math.abs(num) > 999 ? (Math.sign(num) * parseFloat((Math.abs(num) / 1000).toFixed(2))).toString() + 'k' : Math.sign(num) * parseInt(Math.abs(num).toFixed(0));
    if (isUsd) return `$${res}`
    return res
  }

  return (
    <div className="info-card flex flex-col">
      <CountUp {...countUpProps}>
        {({ value }: { value: number }) => (
          <div className="card-value">
            {value}
          </div>
        )}
      </CountUp>
      <div className="card-label">
        {label}
      </div>
    </div>
  )
}
