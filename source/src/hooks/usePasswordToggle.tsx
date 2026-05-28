
import { useState, useMemo } from "react";

import { ReactComponent as EyeOpen } from "../images/icons/EyeOpen.svg"
import { ReactComponent as EyeClosed } from "../images/icons/EyeClosed.svg"

export function usePasswordToggle() {
    const [show, setShow] = useState(false);

    const toggle = () => setShow((prev) => !prev);

    const inputType = show ? "text" : "password";

    const icon = useMemo(() => {
        return show ? (
            <EyeOpen className="size-6 text-primary-40 dark:text-secondary-70" />
        ) : (
            <EyeClosed className="size-6" />
        );
    }, [show]);

    return { inputType, icon, toggle };
}
