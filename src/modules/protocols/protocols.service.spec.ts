import { PoolsIndexerClient } from '@infrastructure/indexer/clients/pools-indexer-client';
import sinon from 'sinon';
import { ProtocolsService } from './protocols.service';

describe('ProtocolsService', () => {
  let indexerClient: sinon.SinonStubbedInstance<PoolsIndexerClient>;
  let sut: ProtocolsService;

  beforeEach(() => {
    indexerClient = sinon.createStubInstance(PoolsIndexerClient);
    indexerClient.getAllSupportedDexs.resolves([
      {
        id: 'protocol-1',
        name: 'name-1',
        url: 'url-1',
        logo: 'logo-1',
      },
      {
        id: 'protocol-2',
        name: 'name-2',
        url: 'url-2',
        logo: 'logo-2',
      },
    ]);

    sut = new ProtocolsService(indexerClient);
  });

  it('Should get the list of protocols for all supported networks and return it', async () => {
    const protocols = [
      {
        id: 'protocol-1',
        name: 'name-1',
        url: 'url-1',
        logo: 'logo-1',
      },
      {
        id: 'protocol-2',
        name: 'name-2',
        url: 'url-2',
        logo: 'logo-2',
      },
      {
        id: 'protocol-3',
        name: 'name-3',
        url: 'url-3',
        logo: 'logo-3',
      },
    ];

    indexerClient.getAllSupportedDexs.resolves(protocols);
    const result = await sut.getAllSupportedProtocols();

    expect(result).toEqual(protocols);
    sinon.assert.calledOnce(indexerClient.getAllSupportedDexs);
  });
});
