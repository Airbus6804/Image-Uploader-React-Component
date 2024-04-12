import Dropzone, { DropzoneRootProps } from "react-dropzone";




export interface ImageData {
    data: ArrayBuffer;
    extension: string;
};



interface Props {
    onDrop: (body:string) => void;

}

export default function(props: Props){

    const onDrop = (files: DropzoneRootProps) => {

        const data:ImageData[] = [];

        

        files.forEach((file:any, index:number) => {

            const reader = new FileReader();

            reader.onload = () => {
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

                    props.onDrop(body);
            
                }
            }


            reader.readAsArrayBuffer(file);

            

        });

        
    }

    return (
        <Dropzone onDrop={onDrop}>
            {({ getRootProps, getInputProps }) => (
                <section>
                    <div id="d" {...getRootProps()} style={{
                        backgroundColor: "rgba(255, 255, 255, 0.295)",
                        border:  "3px dashed" ,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <input {...getInputProps()} />
                        <p>
                            Drag 'n' drop some files here, or click to select
                            files
                        </p>
                        
                    </div>
                </section>
            )}
        </Dropzone>
    );
}