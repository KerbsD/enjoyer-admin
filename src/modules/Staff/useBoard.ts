import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Order } from "@/api/staff";
import { listAllOrders } from "@/api/staff";
import { boardFetchStatuses, staffKeys } from "@/constants/staff";
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
  const arrivalNotice = useRef<{ id: string | number; orders: Order[] } | null>(
    null,
  );
  const audio = useRef<AudioContext | null>(null);

  useEffect(
    () => () => {
      const notice = arrivalNotice.current;
      arrivalNotice.current = null;
      if (notice) toast.dismiss(notice.id);
      void audio.current?.close();
    },
    [],
  );

  const onNewOrders = useCallback((added: Order[]) => {
    const previous = arrivalNotice.current;
    const orders = [...added, ...(previous?.orders ?? [])].slice(0, 10);
    const clearNotice = () => {
      if (arrivalNotice.current?.id === id) arrivalNotice.current = null;
    };
    const id = toast(
      `${orders.length} new ${orders.length === 1 ? "order" : "orders"}`,
      {
        id: previous?.id,
        description: orders
          .map((order) => `#${order.orderNumber} (${order.tableName})`)
          .join(", "),
        duration: Infinity,
        cancel: { label: "Dismiss", onClick: clearNotice },
        onDismiss: clearNotice,
      },
    );
    arrivalNotice.current = { id, orders };
    if (audio.current) playAlert(audio.current);
  }, []);

  const transport = useStaffRealtime(onNewOrders);
  const board = useQuery({
    queryKey: staffKeys.orders,
    queryFn: async ({ signal }) => {
      const pages = await Promise.all(
        boardFetchStatuses.map((status) =>
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

  return {
    sound,
    transport,
    board,
    orders,
    toggleSound,
  };
}
