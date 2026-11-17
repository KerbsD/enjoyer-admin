import type { Category, MenuItem, Option, OptionGroup } from "@/api/menu";

interface AssignmentFormProps {
  item: MenuItem;
  onClose: () => void;
}

interface AssignmentFieldsProps extends AssignmentFormProps {
  groups: OptionGroup[];
  initialIds: number[];
}

interface CategoryCardProps {
  category: Category;
}

interface CategoryFormProps {
  category?: Category;
  onClose: () => void;
}

interface ChoiceFormProps {
  group: OptionGroup;
  option?: Option;
  onClose: () => void;
}

interface ChoiceRowProps {
  option: Option;
  onEdit: () => void;
}

interface GroupCardProps {
  group: OptionGroup;
  onEditGroup: (groupId: number) => void;
  onAddChoice: (groupId: number) => void;
  onEditChoice: (groupId: number, optionId: number) => void;
}

interface GroupFormProps {
  group?: OptionGroup;
  onClose: () => void;
}

interface ItemCardProps {
  item: MenuItem;
  categories: Category[];
  categoryName?: string;
}

interface ItemFormProps {
  item?: MenuItem;
  categories: Category[];
  onClose: () => void;
}

export type {
  AssignmentFieldsProps,
  AssignmentFormProps,
  CategoryCardProps,
  CategoryFormProps,
  ChoiceFormProps,
  ChoiceRowProps,
  GroupCardProps,
  GroupFormProps,
  ItemCardProps,
  ItemFormProps,
};
