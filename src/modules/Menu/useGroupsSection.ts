import { useState } from "react";
import { useGroups } from "./useMenu";

type ChoiceSelection = { groupId: number; optionId?: number };

export function useGroupsSection() {
  const result = useGroups();
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [choice, setChoice] = useState<ChoiceSelection | null>(null);

  const group = result.data?.data.find((value) => value.id === editing);
  const choiceGroup = result.data?.data.find(
    (value) => value.id === choice?.groupId,
  );
  const currentChoice = choiceGroup?.options.find(
    (value) => value.id === choice?.optionId,
  );

  const openNewGroup = () => {
    setEditing("new");
    setChoice(null);
  };
  const openGroup = (groupId: number) => {
    setEditing(groupId);
    setChoice(null);
  };
  const openAddChoice = (groupId: number) => {
    setChoice({ groupId });
    setEditing(null);
  };
  const openEditChoice = (groupId: number, optionId: number) => {
    setChoice({ groupId, optionId });
    setEditing(null);
  };
  const closeGroup = () => setEditing(null);
  const closeChoice = () => setChoice(null);

  return {
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
  };
}
