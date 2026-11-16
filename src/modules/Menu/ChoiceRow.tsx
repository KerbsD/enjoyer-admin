import { peso } from "@/lib/shop-format";
import type { ChoiceRowProps } from "@/types/menu";

export function ChoiceRow({ option, onEdit }: ChoiceRowProps) {
  return (
    <div className="menu-row">
      <div>
        <strong>{option.name}</strong>
        <span>
          {peso(option.priceDelta)} extra · position {option.sortOrder} ·{" "}
          {option.isAvailable ? "Available" : "Unavailable"}
        </span>
      </div>
      <button className="button button-outline" type="button" onClick={onEdit}>
        Edit
      </button>
    </div>
  );
}
