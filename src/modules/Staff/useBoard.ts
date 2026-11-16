import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Order } from "@/api/staff";
import { listAllOrders } from "@/api/staff";
import { boardColumns, staffKeys } from "@/constants/staff";
import { useStaffRealtime } from "./useStaffRealtime";

function playAlert(context: AudioContext) {
  if (context.state === "suspended") void context.resume();
  const tone = context.createOscillator();
  const gain = context.createGain();
  tone.type = "sine";
  tone.frequency.setValueAtTime(660, context.currentTime);
  tone.frequency.setValueAtTime(880, context.currentTime + 0.12);
  gain.gain.setValueAtTime(0.08, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.28);
  tone.connect(gain);
  gain.connect(context.destination);
  tone.start();
  tone.stop(context.currentTime + 0.28);
}

export function useBoard() {
  const [sound, setSound] = useState(false);
  const [arrivals, setArrivals] = useState<Order[]>([]);
  const audio = useRef<AudioContext | null>(null);

  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );

  const onNewOrders = useCallback((added: Order[]) => {
    setArrivals((current) => [...added, ...current].slice(0, 10));
    if (audio.current) playAlert(audio.current);
  }, []);

  const transport = useStaffRealtime(onNewOrders);
  const board = useQuery({
    queryKey: staffKeys.orders,
    queryFn: async ({ signal }) => {
      const pages = await Promise.all(
        boardColumns.map(({ status }) =>
          listAllOrders(status, undefined, signal, true),
        ),
      );
      return pages.flat();
    },
  });
  const orders = board.data || [];

  const toggleSound = () => {
    if (sound) {
      void audio.current?.close();
      audio.current = null;
      setSound(false);
    } else {
      audio.current = new AudioContext();
      void audio.current.resume();
      setSound(true);
    }
  };

  const dismissArrivals = () => setArrivals([]);

  return {
    sound,
    arrivals,
    transport,
    board,
    orders,
    toggleSound,
    dismissArrivals,
  };
}
