import { PropsWithChildren } from "react";
import { Head } from "@inertiajs/inertia-react";

type Props = PropsWithChildren<{
    title?: string;
}>;

const Guest = ({ title, children }: Props) => {
    const headTitle = "e-Lab Forensic Comparator";
    return (
        <>
            <Head title={!title ? headTitle : title + " • " + headTitle} />

            <main>
                <div className="box-border bg-primary pt-8 md:pt-14 pb-4 px-16">
                    <div className="flex justify-center">
                        <span className="text-center text-3xl font-black select-none">
                            Data Center College of the Philippines of Laoag,
                            Inc.
                        </span>
                    </div>
                </div>

                <img
                    src="/storage/assets/dccp-logo.png"
                    className="w-fit mx-auto py-4"
                />
                {children}
            </main>
        </>
    );
};

export default Guest;
