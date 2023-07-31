import { useEffect, useState, useRef } from "react"
import { getDays, getHours, getMinutes, getSeconds } from "../utils/utils"
import { useAppStore } from "../store/app"

export default function AirdropProgress() {
  const app = useAppStore()

  const ref = useRef<HTMLDivElement>(null)
  const [leftTime, setLeftTime] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      let current_local_time = Math.floor(Date.now() / 1000)
      let left = (app.duration - app.currentTime + app.lastTime + app.localTime - current_local_time)
      left = Math.max(left, 0)
      if (ref.current) {
        ref.current.style.width = `${left*100/app.duration}%`
        if (left == 0) {
          ref.current.style.width = '0px'
        }
      }
      if (left > 0) {
        if (getDays(left) > 1) setLeftTime(`${getDays(left)} days`)
        else setLeftTime(`${getHours(left)}h ${getMinutes(left)}m ${getSeconds(left)}s`)
      } else {
        setLeftTime('')
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [ app.duration, app.currentTime, app.lastTime, app.localTime ])

  return (
    <div className="airdrop-progress relative flex">
      <div className="bg-bar absolute top-0 left-0"></div>
      <div className="fill-bar absolute top-0 left-0" ref={ref}></div>
      <div className="text">{leftTime.length?`${leftTime} left until Airdrop`:'Airdrop Time Finished'}</div>
    </div>
  )
}