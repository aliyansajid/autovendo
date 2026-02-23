import { LucideIcon } from "lucide-react";

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureItem = ({
  icon: Icon,
  title,
  description,
}: FeatureItemProps) => {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="bg-primary/10 p-4 rounded-full">
        <Icon className="size-8 text-primary" />
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};
