import { Modal } from "@/components/ui/Modal";
import { ChoiceForm } from "./ChoiceForm";
import { GroupCard } from "./GroupCard";
import { GroupForm } from "./GroupForm";
import { useGroupsSection } from "./useGroupsSection";

export function Groups() {
  const {
    result,
    editing,
    group,
    choiceGroup,
    currentChoice,
    openNewGroup,
    openGroup,
    openAddChoice,
    openEditChoice,
    closeGroup,
    closeChoice,
  } = useGroupsSection();

  return (
    <section className="menu-section">
      <div className="section-heading">
        <div>
          <h2>Option groups & add-ons</h2>
          <p>
            Group changes affect every attached item. Required means minimum
            selections ≥ 1.
          </p>
        </div>
        <button className="button" type="button" onClick={openNewGroup}>
          Add group
        </button>
      </div>
      {result.isPending && <p role="status">Loading add-ons…</p>}
      {result.isError && (
        <p role="alert" className="error">
          {result.error.message}{" "}
          <button className="text-button" onClick={() => void result.refetch()}>
            Retry
          </button>
        </p>
      )}
      {result.data?.data.map((row) => (
        <GroupCard
          key={row.id}
          group={row}
          onEditGroup={openGroup}
          onAddChoice={openAddChoice}
          onEditChoice={openEditChoice}
        />
      ))}
      {editing !== null && (editing === "new" || group) && (
        <Modal
          open
          onClose={closeGroup}
          title={group ? `Edit ${group.name}` : "New option group"}
        >
          <GroupForm key={editing} group={group} onClose={closeGroup} />
        </Modal>
      )}
      {choiceGroup && (
        <Modal
          open
          onClose={closeChoice}
          title={
            currentChoice
              ? `Edit ${currentChoice.name}`
              : `Add a choice to ${choiceGroup.name}`
          }
        >
          <ChoiceForm
            key={`${choiceGroup.id}-${currentChoice?.id ?? "new"}`}
            group={choiceGroup}
            option={currentChoice}
            onClose={closeChoice}
          />
        </Modal>
      )}
    </section>
  );
}
