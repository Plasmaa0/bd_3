import SyntaxHighlighter from "react-syntax-highlighter";
import React from "react";
import {DisplayImage, isImage} from "./ImageView";
import {DisplayPdf, isPdf} from "./pdfView";
import {isDarkTheme} from "../Global/ThemeSwitcher";
import {lightfair as light, darcula as dark} from "react-syntax-highlighter/dist/cjs/styles/hljs";

interface FileViewProps {
    user: string;
    loc: string;
    data: any;
}


function DisplayPlainText(loc: string, data: any) {
    const convert_ext_to_name = (ext: string | undefined) => {
        if (ext === 'js') {
            return 'javascript'
        }
        return ext
    }
    return <div>
        <SyntaxHighlighter language={convert_ext_to_name(loc?.split('.')?.pop())}
                           style={isDarkTheme() ? dark : light}>

            {data}
        </SyntaxHighlighter>
    </div>
}

export function FileDisplay(props: FileViewProps) {
    const {user, loc, data} = props;
    if (isImage(loc)) {
        return DisplayImage(user, loc);
    }
    if (isPdf(loc)) {
        return DisplayPdf(user, loc);
    } else {
        return DisplayPlainText(loc, data);
    }
}