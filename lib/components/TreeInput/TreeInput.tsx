import {
  ActionIcon,
  Checkbox,
  Group,
  Input,
  InputWrapperProps,
  Paper,
  RenderTreeNodePayload,
  Tree,
  TreeNodeData,
  useTree,
} from '@mantine/core';
import { FC } from 'react';

const renderTreeNode = ({ node, expanded, hasChildren, elementProps, tree }: RenderTreeNodePayload) => {
  const checked = tree.isNodeChecked(node.value);
  const indeterminate = tree.isNodeIndeterminate(node.value);

  return (
    <Group gap="xs" mb={4} {...elementProps}>
      <Checkbox.Indicator
        size="sm"
        checked={checked}
        indeterminate={indeterminate}
        onClick={() => (!checked ? tree.checkNode(node.value) : tree.uncheckNode(node.value))}
      />
      <Group gap="sm" onClick={() => tree.toggleExpanded(node.value)}>
        <span>{node.label}</span>
        {hasChildren && <ActionIcon size="xs">{expanded ? '-' : '+'}</ActionIcon>}
      </Group>
    </Group>
  );
};

type Props = InputWrapperProps & {
  treeData: TreeNodeData[];
  initialExpandedState?: Record<string, boolean>;
  initialCheckedState?: string[];
  name?: string;
};

export const TreeInput: FC<Props> = ({ treeData, initialExpandedState, initialCheckedState, name, ...props }) => {
  const tree = useTree({
    initialExpandedState,
    initialCheckedState,
  });

  return (
    <Input.Wrapper {...props}>
      <Paper p="sm">
        {name && tree.checkedState.map(item => <input key={item} type="hidden" name={name} value={item} />)}
        <Tree tree={tree} data={treeData} levelOffset={24} expandOnClick={false} renderNode={renderTreeNode} />
      </Paper>
    </Input.Wrapper>
  );
};
