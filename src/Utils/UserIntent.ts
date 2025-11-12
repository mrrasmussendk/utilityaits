// UtilityAi/Utils/intent.ts

export class IntentGoal {
    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }
}

export type Slots = Readonly<Record<string, unknown | null>>;

export class UserIntent {
    readonly goal: IntentGoal;
    readonly slots?: Slots;
    readonly requestId?: string;
    readonly locale?: string;

    // Overloads
    constructor(goal: IntentGoal, slots?: Slots, requestId?: string, locale?: string);
    /** Legacy convenience: treat string as a 'query' slot */
    constructor(query: string);
    /**
     * Legacy compatibility: (query, delivery, topic) captured into generic slots
     */
    constructor(query: string, delivery: string, topic: string);

    // Implementation
    constructor(...args: any[]) {
        if (typeof args[0] === "string") {
            // Legacy cases
            if (args.length === 1) {
                const query: string = args[0];
                this.goal = new IntentGoal("unspecified");
                this.slots = Object.freeze({ query });
                return;
            }
            if (args.length === 3 && typeof args[1] === "string" && typeof args[2] === "string") {
                const [query, delivery, topic] = args as [string, string, string];
                this.goal = new IntentGoal("legacy");
                this.slots = Object.freeze({ query, delivery, topic });
                return;
            }
            throw new TypeError("Invalid legacy UserIntent constructor arguments.");
        }

        // Standard constructor
        const [goal, slots, requestId, locale] = args as [
            IntentGoal,
                Slots | undefined,
                string | undefined,
                string | undefined
        ];

        if (!(goal instanceof IntentGoal)) {
            throw new TypeError("UserIntent requires an IntentGoal as the first argument.");
        }

        this.goal = goal;
        this.slots = slots ? Object.freeze({ ...slots }) : undefined;
        this.requestId = requestId;
        this.locale = locale;
    }
}
