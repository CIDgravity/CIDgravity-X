import React, { PureComponent } from 'react'
import { withTranslation } from 'react-i18next'
import { Col, Row, Input } from 'reactstrap'

class CustomSizeInput extends PureComponent {
    onValueChange = (event) => {
        console.log('onValueChange')
        console.log(event)
    }

    onUnitChange = (event) => {
        console.log('onUnitChange')
        console.log(event.target.value)
    }

    render() {
        const { t, defaultValue, defaultUnit } = this.props

        return (
            <Row>
                <div class="input-group mb-3">
                    <Col md="7">
                        <Input
                            type="number"
                            className="form-control"
                            name="value"
                            placeholder={t('placeholder')}
                            defaultValue={defaultValue}
                            onChange={(e) => this.onValueChange(e)}
                        />
                    </Col>

                    <Col md="5">
                        <div class="input-group-prepend">
                            <select
                                onChange={(e) => this.onUnitChange(e)}
                                className="form-select"
                                defaultValue={defaultUnit || 'B'}
                            >
                                <option value="B">{t('unit.B')}</option>
                                <option value="KiB">{t('unit.KiB')}</option>
                                <option value="MiB">{t('unit.MiB')}</option>
                                <option value="GiB">{t('unit.GiB')}</option>
                            </select>
                        </div>
                    </Col>
                </div>
            </Row>
        )
    }
}

export default withTranslation('CustomSizeInput')(CustomSizeInput)
