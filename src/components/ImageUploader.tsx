import  { ReactNode, useState } from "react";
import Dropzone, { DropzoneRootProps, Accept } from "react-dropzone";




export interface ImageData {
    data: ArrayBuffer;
    extension: string;
};

type FileTypes = "images" | "videos" | "audios"

export function generateAccept(...fileType:FileTypes[]){

    const types = {
        images : "image/*",
        audios : "audio/*",
        videos : "video/*",
    }

    const ret:{[key:string]: string[]} = {};
    fileType.forEach(f => {
        ret[types[f]] = [];
    })

    return ret;

}



interface Props {
    onDrop: (body:string, urls:Array<string>) => void;
    children: ReactNode;
    style?: React.CSSProperties
    className?: string,
    accept?: Accept,
    loadingPlaceholder?: ReactNode,
    dragHoverPlaceholder?: ReactNode
}

type DropzoneStates = "idle" | "loading" | "dragHover"

export default function(props: Props){

    const [dropzoneState, setDropzoneState] = useState<DropzoneStates>("idle");
     

    const onDrop = (files: DropzoneRootProps) => {

        const data:ImageData[] = [];
        const urls:Array<string> = [];

        setDropzoneState("loading");

        files.forEach(async (file:any, index:number) => {

            const reader = new FileReader();
            

            const readerForDataImage = new FileReader();

            const blobPromise = new Promise<string>((resolve, reject) => {reader.onload = () => {
                if(reader.result instanceof ArrayBuffer) data.push({
                    data: reader.result,
                    extension: file.name
                });
                
                if(index === files.length - 1){

                    const arrays = data.map((d) => {
                        const a = new Uint8Array(d.data);
                        const splittedName = d.extension.split(".");
                        d.extension = splittedName[splittedName.length - 1];
                        return { data: a.toString(), extension: d.extension };
                    });

                    const body = JSON.stringify(arrays);

                    resolve(body);
            
                }
                else reject();
                }
            })

            const urlPromise = new Promise<Array<string>>((resolve, reject) => {

                readerForDataImage.onload = () => {
                    //@ts-expect-error
                    urls.push(readerForDataImage.result!);
                    if(index === files.length -1){
                        resolve(urls)
                    }
                    else reject();
                }

            })

            Promise.all([urlPromise, blobPromise]).then((d) => {
                setDropzoneState("idle");
                console.log(d)
                props.onDrop(d[1], d[0])
            }).catch(() => null)


            reader.readAsArrayBuffer(file);
            readerForDataImage.readAsDataURL(file)

            

        });

        
    }

    let dropzoneContent;

    switch (dropzoneState){
        case "idle":
            dropzoneContent = props.children
            break;
        case "loading":
            dropzoneContent = props.loadingPlaceholder !== undefined ? props.loadingPlaceholder : "Loading..."
            break
        case "dragHover":
            dropzoneContent = props.dragHoverPlaceholder !== undefined ? props.dragHoverPlaceholder : "Drop here"
        break;
    }   

    return (
        <Dropzone onDrop={onDrop} accept={props.accept} onDragEnter={()=>setDropzoneState("dragHover")} onDragLeave={()=>setDropzoneState("idle")}>
            {({ getRootProps, getInputProps }) => (
                <section>
                    
                    <div {...getRootProps()} className={props.className} style={{
                        backgroundColor: "rgba(255, 255, 255, 0.295)",
                        border:  "3px dashed" ,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        ...props.style
                    }}>
                        <input {...getInputProps()} />
                        <p>
                            {dropzoneContent}
                        </p>
                        
                    </div>
                </section>
            )}
        </Dropzone>
    );
}