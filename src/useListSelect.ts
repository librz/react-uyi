import { useState } from 'react'

/**
 * manage state & event of list selection
 */
export default function useListSelect<T>(
  getDisplayItems: () => T[], // used for check all
  isItemSelectable: (item: T) => boolean, // used for check all
  isSameItem: (item1: T, item2: T) => boolean, // used for filter when unselect item
) {

  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  function handleItemSelect(selected: boolean, item: T) {
    if (!isItemSelectable(item)) {
      console.warn("Item is not selectable", item)
      return;
    }
    if (selected) {
      setSelectedItems(oldVal => oldVal.concat(item))
    } else {
      setSelectedItems(oldVal => oldVal.filter(it => !isSameItem(it, item)))
    }
  }

  function handleCheckAllSelect(selected: boolean) {
    if (selected) {
      const displayItems = getDisplayItems()
      setSelectedItems(displayItems.filter(it => isItemSelectable(it)))
    } else {
      setSelectedItems([])
    }
  }

  return [
    selectedItems,
    setSelectedItems,
    handleItemSelect,
    handleCheckAllSelect
  ] as const
}