import { Moon, Sun } from "lucide-react";
import { Button } from "./button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

import { useTheme } from "./theme-provider";
import { useEffect } from "react";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    console.log("Theme changed to:", theme); // ✅ For debugging
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* ❌ Removed border, ✅ Added cursor-pointer */}
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer focus:outline-none ring-0 shadow-none text-blue-400"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
