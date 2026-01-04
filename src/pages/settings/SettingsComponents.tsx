// Toggle Component
export const Toggle = ({
    label,
    description,
    enabled,
    setEnabled,
}: {
    label: string;
    description?: string;
    enabled: boolean;
    setEnabled: (val: boolean) => void;
}) => (
    <div className="flex items-center justify-between py-2">
        <div>
            <p className="font-medium text-foreground">{label}</p>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <button
            onClick={() => setEnabled(!enabled)}
            role="switch"
            aria-checked={enabled ? 'true' : 'false'}
            aria-label={label}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${enabled ? 'bg-primary' : 'bg-muted'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    </div>
);

// Section Header Component
export const SectionHeader = ({ icon: IconComponent, title }: { icon: React.ElementType; title: string }) => (
    <h4 className="font-semibold text-foreground mb-4 flex items-center text-sm uppercase tracking-wide">
        <IconComponent className="w-4 h-4 mr-2 text-primary" weight="fill" />
        {title}
    </h4>
);
