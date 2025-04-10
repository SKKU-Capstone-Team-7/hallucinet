import { DocumentBuilder } from "@nestjs/swagger";

export class BaseAPIDocument {
    public buildler = new DocumentBuilder();

    public initializeOptions() {
        return this.buildler
            .setTitle('Hallucinet')
            .setDescription('Hallucinet API description')
            .setVersion('1.0.0')
            .addTag('swagger')
            .build();
    }
}