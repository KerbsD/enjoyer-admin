import type { GroupCardProps } from "@/types/menu";
import { ChoiceRow } from "./ChoiceRow";

export function GroupCard({
  group,
  onEditGroup,
  onAddChoice,
  onEditChoice,
}: GroupCardProps) {
  return (
    <div className="menu-group">
      <div className="section-heading">
        <div>
          <h3>{group.name}</h3>
          <p>
            Position {group.sortOrder} · Select {group.minSelections}–
            {group.maxSelections} · {group.required ? "Required" : "Optional"}
          </p>
        </div>
        <div className="action-row">
          <button
            className="button button-outline"
            type="button"
            onClick={() => onEditGroup(group.id)}
          >
            Edit group
          </button>
          <button
            className="button button-outline"
            type="button"
            onClick={() => onAddChoice(group.id)}
          >
            Add choice
          </button>
        </div>
      </div>
      {group.options.map((option) => (
        <ChoiceRow
          key={option.id}
          option={option}
          onEdit={() => onEditChoice(group.id, option.id)}
        />
      ))}
    </div>
  );
}
