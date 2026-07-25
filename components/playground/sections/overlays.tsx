import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreHorizontalIcon,
  Delete02Icon,
  PencilEdit02Icon,
  Copy01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { SpecimenGroup } from "@/components/playground/section"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export function OverlaysSection() {
  return (
    <SpecimenGroup label="Triggers">
      <div className="flex flex-wrap items-center gap-3">
        {/* Dialog */}
        <Dialog>
          <DialogTrigger render={<Button variant="outline">Dialog</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New invoice</DialogTitle>
              <DialogDescription>
                Draft an invoice for this project. It won’t be sent until you
                mark it as sent.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost">Cancel</Button>} />
              <DialogClose render={<Button>Create draft</Button>} />
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Alert dialog */}
        <AlertDialog>
          <AlertDialogTrigger
            render={<Button variant="destructive">Alert dialog</Button>}
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete project?</AlertDialogTitle>
              <AlertDialogDescription>
                This cascades to milestones, invoices, and deliverables. This
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Sheet */}
        <Sheet>
          <SheetTrigger render={<Button variant="outline">Sheet</Button>} />
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Project details</SheetTitle>
              <SheetDescription>
                A slide-over inspector, like the task drawer in the samples.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        {/* Dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="icon" aria-label="Actions">
                <HugeiconsIcon icon={MoreHorizontalIcon} />
              </Button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <HugeiconsIcon icon={PencilEdit02Icon} data-icon="inline-start" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon icon={Copy01Icon} data-icon="inline-start" />
                Duplicate
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <HugeiconsIcon icon={Delete02Icon} data-icon="inline-start" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Popover */}
        <Popover>
          <PopoverTrigger render={<Button variant="outline">Popover</Button>} />
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Currency</PopoverTitle>
              <PopoverDescription>
                Only set when a project needs one other than the default.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>

        {/* Tooltip */}
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline">Tooltip</Button>} />
          <TooltipContent>Live immediately for the client</TooltipContent>
        </Tooltip>

        {/* Hover card */}
        <HoverCard>
          <HoverCardTrigger
            render={<Button variant="link">Hover card</Button>}
          />
          <HoverCardContent>
            <p className="text-sm">
              Passwordless auth — the client verifies with a one-time code.
            </p>
          </HoverCardContent>
        </HoverCard>
      </div>
    </SpecimenGroup>
  )
}
