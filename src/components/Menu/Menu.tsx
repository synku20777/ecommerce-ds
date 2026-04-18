import React from "react";
import ReactDOM from "react-dom";

import type { BaseProps } from "@types/common";
import { classNames } from "@utils/classNames";

import "../../../tokens/_tier2-menu.scss";
import "./Menu.scss";

type MenuSize = "sm" | "md" | "lg";
type MenuPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

function normalizePlacement(value: MenuPlacement | undefined): MenuPlacement {
  if (value === "bottom-end" || value === "top-start" || value === "top-end") {
    return value;
  }
  return "bottom-start";
}

function normalizeSize(value: MenuSize | undefined): MenuSize {
  if (value === "sm" || value === "lg") {
    return value;
  }
  return "md";
}

function getFocusableMenuItems(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])'));
}

interface MenuContextValue {
  mounted: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  onClose?: () => void;
  placement: MenuPlacement;
  size: MenuSize;
  menuId: string;
  triggerId: string;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
  setTriggerNode: (node: HTMLElement | null) => void;
  setContentNode: (node: HTMLDivElement | null) => void;
  registerItem: (id: string, node: HTMLButtonElement | null) => void;
  moveFocus: (currentId: string, direction: "next" | "prev" | "first" | "last") => void;
}

const MenuContext = React.createContext<MenuContextValue | null>(null);

function useMenuContext(): MenuContextValue {
  const context = React.useContext(MenuContext);
  if (!context) {
    throw new Error("Menu compound components must be used inside <Menu>.");
  }
  return context;
}

export interface MenuProps extends Omit<BaseProps, "as" | "size" | "variant" | "isDisabled"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  placement?: MenuPlacement;
  size?: MenuSize;
  children: React.ReactNode;
}

export interface MenuTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    Omit<BaseProps, "as" | "size" | "variant" | "isDisabled"> {
  children: React.ReactNode;
}

export interface MenuContentProps extends Omit<BaseProps, "as" | "size" | "variant" | "isDisabled"> {
  label?: string;
  children: React.ReactNode;
}

export interface MenuItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    Omit<BaseProps, "as" | "size" | "variant" | "isDisabled"> {
  children: React.ReactNode;
}

export interface MenuSeparatorProps extends Omit<BaseProps, "as" | "size" | "variant" | "isDisabled"> {}

export interface MenuHeaderProps extends Omit<BaseProps, "as" | "size" | "variant" | "isDisabled"> {
  name?: string;
  email?: string;
  avatar?: React.ReactNode;
}

const MenuRoot = React.forwardRef<HTMLDivElement, MenuProps>(function Menu(
  {
    className,
    open,
    defaultOpen = false,
    onOpenChange,
    onClose,
    placement = "bottom-start",
    size = "md",
    children,
    ...rest
  },
  ref,
) {
  const [mounted, setMounted] = React.useState(false);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = open !== undefined;
  const resolvedOpen = isControlled ? open : internalOpen;

  const menuId = React.useId().replace(/[:]/g, "");
  const triggerId = `ds-menu-trigger-${menuId}`;
  const resolvedMenuId = `ds-menu-panel-${menuId}`;

  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const itemOrderRef = React.useRef<string[]>([]);
  const itemNodesRef = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
      if (!nextOpen) {
        onClose?.();
      }
    },
    [isControlled, onClose, onOpenChange],
  );

  const setTriggerNode = React.useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;
  }, []);

  const setContentNode = React.useCallback((node: HTMLDivElement | null) => {
    contentRef.current = node;
  }, []);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted || !resolvedOpen) {
      return;
    }

    const content = contentRef.current;
    if (!content) {
      return;
    }

    const focusables = getFocusableMenuItems(content);
    if (focusables.length) {
      focusables[0].focus();
    } else {
      content.focus();
    }

    return () => {
      const trigger = triggerRef.current;
      if (trigger && typeof trigger.focus === "function") {
        trigger.focus();
      }
    };
  }, [mounted, resolvedOpen]);

  React.useEffect(() => {
    if (!mounted || !resolvedOpen) {
      return;
    }

    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }

      const content = contentRef.current;
      const trigger = triggerRef.current;

      if (content?.contains(target) || trigger?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside, true);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mounted, resolvedOpen, setOpen]);

  const registerItem = React.useCallback((id: string, node: HTMLButtonElement | null) => {
    if (!itemOrderRef.current.includes(id)) {
      itemOrderRef.current.push(id);
    }

    if (node) {
      itemNodesRef.current.set(id, node);
    } else {
      itemNodesRef.current.delete(id);
      itemOrderRef.current = itemOrderRef.current.filter((entry) => entry !== id);
    }
  }, []);

  const moveFocus = React.useCallback((currentId: string, direction: "next" | "prev" | "first" | "last") => {
    const ids = itemOrderRef.current.filter((id) => {
      const node = itemNodesRef.current.get(id);
      return Boolean(node && !node.disabled);
    });

    if (!ids.length) {
      return;
    }

    const currentIndex = ids.findIndex((id) => id === currentId);
    let nextIndex = currentIndex;

    if (direction === "first") {
      nextIndex = 0;
    } else if (direction === "last") {
      nextIndex = ids.length - 1;
    } else if (direction === "next") {
      nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % ids.length;
    } else {
      nextIndex = currentIndex === -1 ? ids.length - 1 : (currentIndex - 1 + ids.length) % ids.length;
    }

    const target = itemNodesRef.current.get(ids[nextIndex]);
    target?.focus();
  }, []);

  const contextValue = React.useMemo<MenuContextValue>(
    () => ({
      mounted,
      open: resolvedOpen,
      setOpen,
      onClose,
      placement: normalizePlacement(placement),
      size: normalizeSize(size),
      menuId: resolvedMenuId,
      triggerId,
      triggerRef,
      contentRef,
      setTriggerNode,
      setContentNode,
      registerItem,
      moveFocus,
    }),
    [
      mounted,
      moveFocus,
      onClose,
      placement,
      registerItem,
      resolvedMenuId,
      resolvedOpen,
      setContentNode,
      setOpen,
      setTriggerNode,
      size,
      triggerId,
    ],
  );

  return (
    <MenuContext.Provider value={contextValue}>
      <div ref={ref} className={classNames("ds-menu", className)} {...rest}>
        {children}
      </div>
    </MenuContext.Provider>
  );
});

const MenuTrigger = React.forwardRef<HTMLButtonElement, MenuTriggerProps>(function MenuTrigger(
  { className, children, onClick, ...rest },
  ref,
) {
  const { open, setOpen, menuId, triggerId, setTriggerNode } = useMenuContext();

  const localRef = React.useRef<HTMLButtonElement | null>(null);

  React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement, []);

  React.useEffect(() => {
    setTriggerNode(localRef.current);
    return () => setTriggerNode(null);
  }, [setTriggerNode]);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      setOpen(!open);
    }
  };

  return (
    <button
      {...rest}
      ref={localRef}
      id={triggerId}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={menuId}
      className={className}
      onClick={handleClick}
    >
      {children}
    </button>
  );
});

const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(function MenuContent(
  { className, label = "Menu", children, ...rest },
  ref,
) {
  const {
    mounted,
    open,
    setOpen,
    placement,
    size,
    menuId,
    triggerId,
    triggerRef,
    contentRef,
    setContentNode,
  } = useMenuContext();

  const [position, setPosition] = React.useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const setRefs = React.useCallback(
    (node: HTMLDivElement | null) => {
      setContentNode(node);
      if (!ref) {
        return;
      }
      if (typeof ref === "function") {
        ref(node);
      } else {
        ref.current = node;
      }
    },
    [ref, setContentNode],
  );

  const reposition = React.useCallback(() => {
    const trigger = triggerRef.current;
    const panel = contentRef.current;
    if (!trigger || !panel) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const gap = 4;

    let top = triggerRect.bottom + gap;
    let left = triggerRect.left;

    if (placement === "bottom-end") {
      left = triggerRect.right - panelRect.width;
    } else if (placement === "top-start") {
      top = triggerRect.top - panelRect.height - gap;
    } else if (placement === "top-end") {
      top = triggerRect.top - panelRect.height - gap;
      left = triggerRect.right - panelRect.width;
    }

    const maxLeft = window.innerWidth - panelRect.width - gap;
    const maxTop = window.innerHeight - panelRect.height - gap;

    setPosition({
      top: Math.max(gap, Math.min(top, maxTop)),
      left: Math.max(gap, Math.min(left, maxLeft)),
    });
  }, [contentRef, placement, triggerRef]);

  React.useLayoutEffect(() => {
    if (!mounted || !open) {
      return;
    }

    reposition();

    const handleViewportChange = () => reposition();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [mounted, open, reposition]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key === "Tab") {
      setOpen(false);
    }
  };

  if (!mounted || !open) {
    return null;
  }

  return ReactDOM.createPortal(
    <div
      {...rest}
      ref={setRefs}
      id={menuId}
      role="menu"
      aria-labelledby={triggerId}
      tabIndex={-1}
      className={classNames("ds-menu__panel", `ds-menu__panel--${size}`, className)}
      style={{ top: position.top, left: position.left, ...(rest.style ?? {}) }}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>,
    document.body,
  );
});

const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(
  { className, children, onClick, onKeyDown, disabled, ...rest },
  ref,
) {
  const { setOpen, registerItem, moveFocus } = useMenuContext();
  const itemId = React.useId().replace(/[:]/g, "");
  const localRef = React.useRef<HTMLButtonElement | null>(null);

  React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement, []);

  React.useEffect(() => {
    registerItem(itemId, localRef.current);
    return () => registerItem(itemId, null);
  }, [itemId, registerItem]);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event);
    if (!event.defaultPrevented && !disabled) {
      setOpen(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus(itemId, "next");
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(itemId, "prev");
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      moveFocus(itemId, "first");
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      moveFocus(itemId, "last");
    }
  };

  return (
    <button
      {...rest}
      ref={localRef}
      type="button"
      role="menuitem"
      disabled={disabled}
      className={classNames("ds-menu-item", className, {
        "ds-menu-item--disabled": Boolean(disabled),
      })}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </button>
  );
});

const MenuSeparator = React.forwardRef<HTMLHRElement, MenuSeparatorProps>(function MenuSeparator(
  { className, ...rest },
  ref,
) {
  return <hr {...rest} ref={ref} role="separator" aria-hidden="true" className={classNames("ds-menu-separator", className)} />;
});

const MenuHeader = React.forwardRef<HTMLDivElement, MenuHeaderProps>(function MenuHeader(
  { className, name, email, avatar, ...rest },
  ref,
) {
  return (
    <div {...rest} ref={ref} className={classNames("ds-menu-header", className)}>
      <span className={classNames("ds-menu-header__avatar", { "ds-menu-header__avatar--initials": typeof avatar === "string" })} aria-hidden="true">
        {avatar}
      </span>
      <span className="ds-menu-header__text">
        {name ? <span className="ds-menu-header__name">{name}</span> : null}
        {email ? <span className="ds-menu-header__email">{email}</span> : null}
      </span>
    </div>
  );
});

interface MenuComponent extends React.ForwardRefExoticComponent<MenuProps & React.RefAttributes<HTMLDivElement>> {
  Trigger: React.ForwardRefExoticComponent<MenuTriggerProps & React.RefAttributes<HTMLButtonElement>>;
  Content: React.ForwardRefExoticComponent<MenuContentProps & React.RefAttributes<HTMLDivElement>>;
  Item: React.ForwardRefExoticComponent<MenuItemProps & React.RefAttributes<HTMLButtonElement>>;
  Separator: React.ForwardRefExoticComponent<MenuSeparatorProps & React.RefAttributes<HTMLHRElement>>;
  Header: React.ForwardRefExoticComponent<MenuHeaderProps & React.RefAttributes<HTMLDivElement>>;
}

const Menu = MenuRoot as MenuComponent;

Menu.Trigger = MenuTrigger;
Menu.Content = MenuContent;
Menu.Item = MenuItem;
Menu.Separator = MenuSeparator;
Menu.Header = MenuHeader;

export default Menu;

export function MenuExample(): React.JSX.Element {
  return (
    <Menu placement="bottom-start" size="md" onClose={() => {}}>
      <Menu.Trigger className="demo-trigger">Open Menu</Menu.Trigger>

      <Menu.Content label="Actions">
        <Menu.Header name="Phillip George" email="phillip@example.com" avatar="PG" />
        <Menu.Separator />
        <Menu.Item>Profile</Menu.Item>
        <Menu.Item>Settings</Menu.Item>
        <Menu.Item>Sign out</Menu.Item>
      </Menu.Content>
    </Menu>
  );
}