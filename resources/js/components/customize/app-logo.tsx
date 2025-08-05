import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-24 items-center justify-center rounded-md">
                <AppLogoIcon className="text-whie size-24 fill-current dark:text-black" />
            </div>
            {/* <div className="ml-1 grid flex-1 text-left text-md">
                <span className="mb-0.5 truncate leading-none font-semibold group-data-[collapsible=icon]:hidden">CheckWise</span>
            </div> */}
        </>
    );
}
