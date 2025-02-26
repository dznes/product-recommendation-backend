import { ToolConfig } from "./index";

interface GetOrdersProps {
    userId: string;
}

export const getOrdersTool: ToolConfig<GetOrdersProps> = {
    definition: {
        type: "function",
        function: {
            name: "get_orders",
            description: "Retrieve a list of orders associated with a specific user ID.",
            parameters: {
                type: "object",
                properties: {
                    userId: {
                        type: "string",
                        pattern: "^[0-9a-fA-F-]{36}$", // Matches UUID format
                        description: "User ID (UUID format) to fetch orders for.",
                    },
                },
                required: ["userId"],
            },
        },
    },
    handler: async ({ userId }) => {
        try {
            return await getOrders(userId);
        } catch (error) {
            console.error("Error fetching orders:", error);
            throw new Error("Failed to fetch orders.");
        }
    },
};

// Function to retrieve orders from the database
async function getOrders(userId: string): Promise<any[]> {
    if (!/^[0-9a-fA-F-]{36}$/.test(userId)) {
        throw new Error("Invalid userId format. Expected a UUID.");
    }

    const response = await fetch(`http://localhost:3333/api/orders/users/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch orders from API.");
    }

    const { orders } = await response.json();
    return orders;
}
