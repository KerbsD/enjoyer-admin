import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  enrollOrderingTerminal,
  getOrderingNetwork,
  revokeOrderingTerminal,
  setOrderingNetwork,
} from "@/api/orderingNetwork";
import { ORDERING_NETWORK_QUERY } from "@/constants/orderingNetwork";
import { shopTime } from "@/lib/shop-format";
import { setTerminalHint } from "./useOrderingTerminal";

type Action =
  | { type: "enroll" | "override"; address: string }
  | { type: "disable" | "revoke" };

export function OrderingNetworkPanel() {
  const queryClient = useQueryClient();
  const network = useQuery({
    queryKey: ORDERING_NETWORK_QUERY,
    queryFn: getOrderingNetwork,
  });
  const [address, setAddress] = useState("");
  const [pending, setPending] = useState<Action | null>(null);
  const change = useMutation({
    mutationFn: async (action: Action) => {
      switch (action.type) {
        case "enroll":
          return enrollOrderingTerminal(action.address);
        case "override":
          return setOrderingNetwork({
            action: "override",
            address: action.address,
          });
        case "disable":
          return setOrderingNetwork({ action: "disable" });
        case "revoke":
          return revokeOrderingTerminal();
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData(ORDERING_NETWORK_QUERY, result);
      setTerminalHint(result.data.thisTerminal);
      setAddress("");
      setPending(null);
    },
  });
  const state = network.data?.data;
  const busy = change.isPending;
  const ask = (action: Action) => {
    change.reset();
    setPending(action);
  };

  return (
    <section
      className="store-status mt-6"
      aria-labelledby="ordering-network-heading"
    >
      <div className="section-heading">
        <h2 id="ordering-network-heading">Ordering network</h2>
        <button
          type="button"
          className="button button-outline"
          disabled={busy || network.isFetching}
          onClick={() => void network.refetch()}
        >
          Refresh detected IP
        </button>
      </div>
      <p>
        Menu browsing stays public. When enabled, only traffic from the approved
        IP can use table ordering.
      </p>
      {network.isPending && <p role="status">Loading ordering network…</p>}
      {network.isError && (
        <p className="error" role="alert">
          {network.error.message}
        </p>
      )}
      {state && (
        <>
          <p>
            <strong>
              {state.enabled ? "Restriction enabled" : "Restriction disabled"}
            </strong>
          </p>
          <dl className="grid gap-2 sm:grid-cols-[max-content_1fr]">
            <dt>Approved IP</dt>
            <dd className="wrap-anywhere">{state.address ?? "Not set"}</dd>
            <dt>Detected IP</dt>
            <dd className="wrap-anywhere">
              {state.detectedAddress ?? "Unavailable"}
            </dd>
            <dt>Auto-update</dt>
            <dd>
              {state.thisTerminal
                ? "This browser"
                : state.terminalEnrolled
                  ? "Another browser"
                  : "Off"}
            </dd>
            <dt>Last changed</dt>
            <dd>{state.updatedAt ? shopTime(state.updatedAt) : "Never"}</dd>
          </dl>
          <p>
            Enroll only from the dedicated café browser. Verify that guest Wi-Fi
            uses the same public IP before enabling.
          </p>
          {!state.detectedAddress && (
            <p role="status">
              The API could not verify your address. Check its ordering IP
              configuration before enabling or changing the restriction.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="button"
              disabled={!state.detectedAddress || busy}
              onClick={() => {
                if (state.detectedAddress)
                  ask({ type: "enroll", address: state.detectedAddress });
              }}
            >
              {state.terminalEnrolled
                ? "Replace enrolled terminal"
                : "Enroll this terminal"}
            </button>
            {state.terminalEnrolled && (
              <button
                type="button"
                className="button button-outline"
                disabled={busy}
                onClick={() => ask({ type: "revoke" })}
              >
                Revoke terminal
              </button>
            )}
            {state.enabled && (
              <button
                type="button"
                className="button button-outline"
                disabled={busy}
                onClick={() => ask({ type: "disable" })}
              >
                Disable restriction
              </button>
            )}
          </div>
          <form
            className="mt-2 flex flex-wrap items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!busy && address.trim())
                ask({ type: "override", address: address.trim() });
            }}
          >
            <label className="grid gap-1">
              Manual IPv4 or IPv6 address
              <input
                className="rounded-md border px-3 py-2"
                value={address}
                maxLength={45}
                required
                spellCheck={false}
                autoComplete="off"
                onChange={(event) => setAddress(event.target.value)}
              />
            </label>
            <button
              type="submit"
              className="button button-outline"
              disabled={busy || !state.detectedAddress}
            >
              Set approved IP
            </button>
          </form>
        </>
      )}
      {pending && (
        <div
          className="mt-3 rounded-md border p-3"
          role="group"
          aria-label="Confirm network change"
        >
          <p>
            {pending.type === "enroll"
              ? `Approve ${pending.address} and allow this browser to update the IP automatically?`
              : pending.type === "override"
                ? `Approve ${pending.address} and revoke automatic updates?`
                : pending.type === "revoke"
                  ? "Revoke automatic updates but keep the approved IP?"
                  : "Allow ordering from any network and revoke the enrolled browser?"}
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="button button-outline"
              disabled={busy}
              onClick={() => {
                change.reset();
                setPending(null);
              }}
            >
              Keep settings
            </button>
            <button
              type="button"
              className="button"
              disabled={busy}
              onClick={() => change.mutate(pending)}
            >
              {busy ? "Saving…" : "Confirm change"}
            </button>
          </div>
        </div>
      )}
      {change.isError && (
        <p className="error" role="alert">
          {change.error.message}
        </p>
      )}
      {change.isSuccess && <p role="status">Ordering network updated.</p>}
    </section>
  );
}
