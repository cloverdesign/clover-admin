import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { SpecimenGroup } from "@/components/playground/section"

export function InputsSection() {
  return (
    <div className="flex flex-col gap-8">
      <SpecimenGroup label="Text">
        <div className="grid max-w-md gap-4">
          <div className="grid gap-2">
            <Label htmlFor="pg-email">Contact email</Label>
            <Input id="pg-email" type="email" placeholder="client@example.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pg-brief">Project brief</Label>
            <Textarea
              id="pg-brief"
              placeholder="Short description…"
              className="min-h-20"
            />
          </div>
          <div className="grid gap-2">
            <Label>Project type</Label>
            <Select defaultValue="brand">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brand">Brand identity</SelectItem>
                <SelectItem value="web">Website</SelectItem>
                <SelectItem value="product">Product design</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SpecimenGroup>

      <SpecimenGroup label="Choice">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Checkbox id="pg-terms" defaultChecked />
            <Label htmlFor="pg-terms">Notify client on send</Label>
          </div>
          <RadioGroup defaultValue="phase">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="phase" id="pg-phase" />
              <Label htmlFor="pg-phase">New phase on project</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="project" id="pg-project" />
              <Label htmlFor="pg-project">New linked project</Label>
            </div>
          </RadioGroup>
          <div className="flex items-center gap-3">
            <Switch id="pg-archived" defaultChecked />
            <Label htmlFor="pg-archived">Show archived</Label>
          </div>
        </div>
      </SpecimenGroup>

      <SpecimenGroup label="Range">
        <Slider defaultValue={[60]} max={100} step={1} className="max-w-md" />
      </SpecimenGroup>

      <SpecimenGroup label="One-time code">
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            {Array.from({ length: 6 }, (_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </SpecimenGroup>
    </div>
  )
}
