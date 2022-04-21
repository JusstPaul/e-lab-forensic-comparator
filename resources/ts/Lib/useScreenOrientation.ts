// https://github.com/bence-toth/react-hook-screen-orientation

import { useState, useEffect } from "react";

const getOrientation = () => window.screen?.orientation?.type;

const useScreenOrientation = () => {
    const [orientation, setOrientation] = useState(getOrientation());

    const updateOrientation = () => {
        setOrientation(getOrientation());
    };

    useEffect(() => {
        window.addEventListener("orientationchange", updateOrientation);
        return () => {
            window.removeEventListener("orientationchange", updateOrientation);
        };
    }, []);

    return orientation;
};

export default useScreenOrientation;
