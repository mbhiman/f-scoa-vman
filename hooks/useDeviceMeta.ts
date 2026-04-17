"use client";

import { useEffect, useState } from "react";

type DeviceMeta = {
    ip: string;
    deviceId: string;
};

export function useDeviceMeta() {
    const [meta, setMeta] = useState<DeviceMeta>({
        ip: "",
        deviceId: "",
    });

    useEffect(() => {
        const init = async () => {
            try {
                // 1. Check cache first
                const cached = localStorage.getItem("device_meta");

                if (cached) {
                    setMeta(JSON.parse(cached));
                    return;
                }

                // 2. Fetch IP
                const res = await fetch("https://api.ipify.org/?format=json");
                const data = await res.json();

                const ip = data.ip || "0.0.0.0";

                // 3. Generate device ID
                const deviceId = `${navigator.userAgent.split(" ")[0]}-${ip}-${crypto.randomUUID()}`;

                const result = { ip, deviceId };

                // 4. Save to state + localStorage
                setMeta(result);
                localStorage.setItem("device_meta", JSON.stringify(result));

            } catch (error) {
                console.error("Device meta error:", error);

                // fallback
                const fallback = {
                    ip: "0.0.0.0",
                    deviceId: `unknown-${crypto.randomUUID()}`,
                };

                setMeta(fallback);
            }
        };

        init();
    }, []);

    return meta;
}