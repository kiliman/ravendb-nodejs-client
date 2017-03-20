import {RavenCommand} from '../RavenCommand';
import {ServerNode} from '../../Http/ServerNode';
import {IRavenCommandResponse} from "../IRavenCommandResponse";
import {IResponse, IResponseBody} from "../../Http/IResponse";
import {DocumentKey} from "../../Documents/IDocument";
import {RequestMethods} from "../../Http/Request/RequestMethod";
import {InvalidOperationException, DocumentDoesNotExistsException, ErrorResponseException} from "../DatabaseExceptions";
import {StringUtil} from "../../Utility/StringUtil";

export class DeleteDocumentCommand extends RavenCommand {
  protected key?: DocumentKey;
  protected etag?: number;

  constructor(key: DocumentKey, etag?: number) {
    super('', RequestMethods.Delete);

    this.key = key;
    this.etag = etag;
  }

  public createRequest(serverNode: ServerNode): void {
    if (!this.key) {
      throw new InvalidOperationException('Null Key is not valid');
    }

    if (!('string' === (typeof this.key))) {
      throw new InvalidOperationException('Key must be a string');
    }

    this.params = {id: this.key};

    if (this.etag) {
      this.headers = {'If-Match': StringUtil.format('"{0}"', this.etag)};
    }

    this.endPoint = StringUtil.format(
      '{0}/databases/{1}/docs',
      serverNode.url,
      serverNode.database
    );
  }

  public setResponse(response: IResponse): IRavenCommandResponse | null | void {
    const responseBody: IResponseBody = response.body;

    if (!responseBody) {
      throw new DocumentDoesNotExistsException(StringUtil.format('Couldn\'t find The Document {0}', this.key));
    } else if ((204 !== responseBody.statusCode) && responseBody.Error) {
      throw new ErrorResponseException(responseBody.Error);
    }
  }
}