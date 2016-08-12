'use strict'

// **Github:** https://github.com/toajs/quic
//
// **License:** MIT

const tman = require('tman')
const assert = require('assert')
const frame = require('../lib/frame')
const packet = require('../lib/packet')
const QuicError = require('../lib/error')
const bufferFromBytes = require('../lib/util').bufferFromBytes

tman.suite('frame', function () {
  tman.suite('PaddingFrame', function () {
    const PaddingFrame = frame.PaddingFrame

    tman.it('new PaddingFrame', function () {
      let paddingFrame = new PaddingFrame()

      assert.strictEqual(paddingFrame.flag, 0)
      assert.ok(paddingFrame.toBuffer().equals(bufferFromBytes([0x00])))
    })
  })

  tman.suite('ResetStreamFrame', function () {
    const ResetStreamFrame = frame.ResetStreamFrame

    tman.it('new ResetStreamFrame', function () {
      let streamId = frame.StreamId.fromId(1)
      let error = new QuicError(1)
      let offset = bufferFromBytes([0x01, 0x2, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08])
      let resetStreamFrame = new ResetStreamFrame(streamId, offset, error)

      assert.strictEqual(resetStreamFrame.flag, 1)
      assert.ok(resetStreamFrame.toBuffer().equals(bufferFromBytes([
        0x01,
        0x01, 0x00, 0x00, 0x00,
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
        0x01, 0x00, 0x00, 0x00
      ])))
    })
  })

  tman.suite('QuicTag', function () {
    const QuicTag = frame.QuicTag

    tman.it('QuicTag.fromBuffer', function () {
      let buf = bufferFromBytes([
        // message tag (kPRST)
        'P', 'R', 'S', 'T',
        // num_entries (2) + padding
        0x03, 0x00, 0x00, 0x00,
        // tag kRNON
        'R', 'N', 'O', 'N',
        // end offset 8
        0x08, 0x00, 0x00, 0x00,
        // tag kRSEQ
        'R', 'S', 'E', 'Q',
        // end offset 16
        0x10, 0x00, 0x00, 0x00,
        'C', 'A', 'D', 'R',
        // end offset 16
        0x18, 0x00, 0x00, 0x00,
        // nonce proof
        0x89, 0x67, 0x45, 0x23,
        0x01, 0xEF, 0xCD, 0xAB,
        // rejected packet number
        0xBC, 0x9A, 0x78, 0x56,
        0x34, 0x12, 0x00, 0x00,
        // client address
        0x02, 0x00,
        0x04, 0x1F, 0xC6, 0x2C,
        0xBB, 0x01
      ])
      let quicTag = QuicTag.fromBuffer(buf)
      console.log(quicTag)

      assert.strictEqual(quicTag.name, 'PRST')
      assert.deepEqual(quicTag.keys, ['RNON', 'RSEQ', 'CADR'])

      let tags = quicTag.getTags()
      assert.ok(tags.RNON.equals(bufferFromBytes([
        0x89, 0x67, 0x45, 0x23,
        0x01, 0xEF, 0xCD, 0xAB
      ])))
      assert.ok(tags.RSEQ.equals(bufferFromBytes([
        0xBC, 0x9A, 0x78, 0x56,
        0x34, 0x12, 0x00, 0x00
      ])))
      assert.ok(tags.CADR.equals(bufferFromBytes([
        0x02, 0x00,
        0x04, 0x1F, 0xC6, 0x2C,
        0xBB, 0x01
      ])))
    })

    tman.it('new QuicTag', function () {
      let quicTag = new QuicTag('PRST')
      quicTag.setTag('RNON', bufferFromBytes([
        0x89, 0x67, 0x45, 0x23,
        0x01, 0xEF, 0xCD, 0xAB
      ]))

      quicTag.setTag('RSEQ', bufferFromBytes([
        0xBC, 0x9A, 0x78, 0x56,
        0x34, 0x12, 0x00, 0x00
      ]))

      quicTag.setTag('CADR', bufferFromBytes([
        0x02, 0x00,
        0x04, 0x1F, 0xC6, 0x2C,
        0xBB, 0x01
      ]))

      assert.ok(quicTag.toBuffer().equals(bufferFromBytes([
        // message tag (kPRST)
        'P', 'R', 'S', 'T',
        // num_entries (2) + padding
        0x03, 0x00, 0x00, 0x00,
        // tag kRNON
        'R', 'N', 'O', 'N',
        // end offset 8
        0x08, 0x00, 0x00, 0x00,
        // tag kRSEQ
        'R', 'S', 'E', 'Q',
        // end offset 16
        0x10, 0x00, 0x00, 0x00,
        'C', 'A', 'D', 'R',
        // end offset 16
        0x18, 0x00, 0x00, 0x00,
        // nonce proof
        0x89, 0x67, 0x45, 0x23,
        0x01, 0xEF, 0xCD, 0xAB,
        // rejected packet number
        0xBC, 0x9A, 0x78, 0x56,
        0x34, 0x12, 0x00, 0x00,
        // client address
        0x02, 0x00,
        0x04, 0x1F, 0xC6, 0x2C,
        0xBB, 0x01
      ])))
    })
  })
})
