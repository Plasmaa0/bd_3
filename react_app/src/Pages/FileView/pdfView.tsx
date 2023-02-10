import {api_url} from "../../Config";
import {GetToken, GetUser} from "../../Functions/DataStoring";



export function isPdf(file: string) {
    return file.endsWith('pdf');
}

export function DisplayPdf(user: string, file: string) {
    return <iframe src={`${api_url}/file/${user}/` + file + '?' + new URLSearchParams({
        token: GetToken(),
        user: GetUser()
    })}
    style={
        // make iframe fill the whole page
        {
            width: '100%',
            height: '100%',
            border: 'none'
        }
    }
    />;

    // return <PDFViewer
    //     document={{
    //         url: `${api_url}/file/${user}/` + file + '?' + new URLSearchParams({
    //             token: GetToken(),
    //             user: GetUser()
    //         })
    //     }}
    // />
}